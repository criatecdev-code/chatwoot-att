
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contacts = await prisma.contact.findMany({
        where: {
            name: {
                contains: 'Cátia'
            }
        }
    });
    console.log('Contacts found:', JSON.stringify(contacts, null, 2));

    const conversations = await prisma.conversation.findMany({
        where: {
            contact_id: {
                in: contacts.map(c => c.id)
            }
        },
        include: {
            contact: true
        }
    });
    console.log('Conversations found:', JSON.stringify(conversations, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
