
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const contacts = await prisma.contact.findMany({
        where: {
            OR: [
                { phone: { contains: 'lid' } },
                { phone_normalized: { contains: 'lid' } },
                { name: { contains: 'lid' } },
                { phone: { contains: '3eb' } } // common LID prefix parts
            ]
        }
    });
    console.log('LID-like Contacts:', JSON.stringify(contacts, null, 2));

    const allContacts = await prisma.contact.findMany({
        take: 50,
        orderBy: { created_at: 'desc' }
    });
    console.log('Recent 50 Contacts:', JSON.stringify(allContacts.map(c => ({ id: c.id, name: c.name, phone: c.phone })), null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
