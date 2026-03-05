
// PHONE & IDENTIFIER EXTRACTION
const { phone: rawPhone, jid: remoteJidFromMsg } = extractPhoneFromBaileys(msg);
const phone = normalizePhone(rawPhone);
const isLid = remoteJidFromMsg?.endsWith('@lid');

let contact: any = null;
let contactIds: string[] = [];
let pushName = msg.pushName;

// Identify the correct name hint (especially for echoes)
if (fromMe && remoteJidFromMsg) {
    const cachedContact = (sock as any).contacts?.[remoteJidFromMsg];
    if (cachedContact?.name || cachedContact?.notify) {
        pushName = cachedContact.name || cachedContact.notify;
        console.log(`[WhatsApp Debug] Found recipient name from agent cache: ${pushName}`);
    }
}

// STEP 1: Look by Phone/JID
if (phone) {
    const phoneNoPlus = phone.startsWith('+') ? phone.slice(1) : phone;
    const searchTerms = [phone, phoneNoPlus];

    if (phone.startsWith('+55') && phone.length === 14 && phone[5] === '9') {
        const phoneNo9 = phone.slice(0, 5) + phone.slice(6);
        searchTerms.push(phoneNo9);
    } else if (phone.startsWith('+55') && phone.length === 13) {
        const phoneWith9 = phone.slice(0, 5) + '9' + phone.slice(5);
        searchTerms.push(phoneWith9);
    }

    const foundContacts = await this.prisma.contact.findMany({
        where: {
            organization_id: organizationId,
            OR: [
                { phone_normalized: { in: searchTerms } },
                { phone: { in: searchTerms } }
            ]
        }
    });

    if (foundContacts.length > 0) {
        contact = foundContacts[0];
        contactIds = foundContacts.map(c => c.id);
    }
}

// STEP 2: Look by Name (Merge Logic)
if (!contact && pushName) {
    console.log(`[WhatsApp Debug] Searching for contact by name: ${pushName}`);
    const namedContact = await this.prisma.contact.findFirst({
        where: {
            organization_id: organizationId,
            name: {
                equals: pushName
            }
        }
    });
    if (namedContact) {
        contact = namedContact;
        contactIds = [namedContact.id];
        console.log(`[WhatsApp Debug] Found contact by name match: ${namedContact.id}`);
    }
}

// STEP 3: Find or Reopen Conversation
let conversation: any = null;
if (contactIds.length > 0) {
    conversation = await this.prisma.conversation.findFirst({
        where: {
            contact_id: { in: contactIds },
            inbox_id: instanceData.inbox_id,
            status: 'open'
        },
        orderBy: { updated_at: 'desc' },
        include: { contact: true }
    });

    if (!conversation) {
        conversation = await this.prisma.conversation.findFirst({
            where: {
                contact_id: { in: contactIds },
                inbox_id: instanceData.inbox_id
            },
            orderBy: { updated_at: 'desc' },
            include: { contact: true }
        });
    }
}

// STEP 4: Metadata Fallback (by JID user part)
if (!conversation && remoteJidFromMsg) {
    const getJidUser = (jid: string) => jid ? jid.split('@')[0].split(':')[0] : '';
    const targetUser = getJidUser(remoteJidFromMsg);

    const recentConvs = await this.prisma.conversation.findMany({
        where: { inbox_id: instanceData.inbox_id },
        orderBy: { updated_at: 'desc' },
        take: 50,
        include: { contact: true }
    });

    const match = recentConvs.find(c => {
        const meta = c.metadata as any;
        return getJidUser(meta?.remoteJid) === targetUser;
    });

    if (match) {
        conversation = match;
        contact = match.contact;
        console.log(`[WhatsApp Debug] Found conversation by metadata match! ID: ${match.id}`);
    }
}

// STEP 5: Create Contact if still nothing
if (!contact) {
    if (!phone && !isLid) {
        console.error('[WhatsApp] Could not extract valid phone from message', msg.key);
        continue;
    }

    const phoneToSave = isLid ? null : phone;
    contact = await this.prisma.contact.create({
        data: {
            organization_id: organizationId,
            phone: phoneToSave,
            phone_normalized: phoneToSave,
            name: pushName || (isLid ? 'Contato LID' : phoneToSave || 'Novo Contato')
        }
    });
    try {
        const stages = await this.crmService.getStages(organizationId);
        if (stages?.[0]) await this.crmService.moveContact(organizationId, contact.id, stages[0].id);
    } catch (e) { }
}

// STEP 6: Ensure Conversation exists
if (!conversation) {
    conversation = await this.prisma.conversation.findFirst({
        where: { contact_id: contact.id, inbox_id: instanceData.inbox_id, status: 'open' }
    });

    if (!conversation) {
        conversation = await this.prisma.conversation.findFirst({
            where: { contact_id: contact.id, inbox_id: instanceData.inbox_id }
        });
    }

    if (conversation) {
        const meta = (conversation.metadata as any) || {};
        conversation = await(this.prisma.conversation as any).update({
            where: { id: conversation.id },
            data: {
                metadata: { ...meta, remoteJid: remoteJidFromMsg },
                status: 'open',
                unread_count: fromMe ? 0 : 1
            }
        });
    } else {
        conversation = await(this.prisma.conversation as any).create({
            data: {
                organization_id: organizationId,
                contact_id: contact.id,
                inbox_id: instanceData.inbox_id,
                status: 'open',
                unread_count: fromMe ? 0 : 1,
                metadata: { remoteJid: remoteJidFromMsg }
            }
        });
    }
    this.gateway.notifyConversationUpdate(organizationId, conversation);
} else {
    // Update existing conversation state
    const meta = (conversation.metadata as any) || {};
    if (meta.remoteJid !== remoteJidFromMsg || conversation.status !== 'open') {
        conversation = await(this.prisma.conversation as any).update({
            where: { id: conversation.id },
            data: {
                metadata: { ...meta, remoteJid: remoteJidFromMsg },
                status: 'open',
                unread_count: fromMe ? conversation.unread_count : { increment: 1 }
            }
        });
        this.gateway.notifyConversationUpdate(organizationId, conversation);
    }
}

if (!conversation || !contact) {
    console.error('[WhatsApp] Failed to resolve conversation or contact for message', msg.key.id, 'conversation:', !!conversation, 'contact:', !!contact);
    continue;
}

// AUTO-HEAL: If contact has no phone but we have one from the message, update it.
if (contact && !contact.phone && phone) {
    console.log(`[WhatsApp] Auto-healing contact ${contact.id} with phone ${phone}`);
    try {
        const updatedContact = await this.prisma.contact.update({
            where: { id: contact.id },
            data: {
                phone: phone,
                phone_normalized: phone
            }
        });
        contact = updatedContact; // Update local reference
    } catch (error) {
        console.error('[WhatsApp] Failed to auto-heal contact phone:', error);
    }
}
