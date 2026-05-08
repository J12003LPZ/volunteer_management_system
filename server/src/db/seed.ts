import { getDb, schema } from './index';
import bcrypt from 'bcrypt';

async function main() {
  const db = getDb() as any;

  // Wipe in FK-safe order
  await db.delete(schema.attendance);
  await db.delete(schema.shiftAssignments);
  await db.delete(schema.shifts);
  await db.delete(schema.events);
  await db.delete(schema.messages);
  await db.delete(schema.users);
  await db.delete(schema.volunteers);
  await db.delete(schema.settings);

  await db.insert(schema.settings).values({ organizationName: 'VolunteerHub' });

  const adminHash = await bcrypt.hash('admin123', 10);
  await db.insert(schema.users).values({
    email: 'admin@vms.local', passwordHash: adminHash, role: 'admin',
  });

  const volunteerSeed = [
    ['Maria', 'Garcia', 'maria@example.com', 'active'],
    ['James', 'Lee', 'james@example.com', 'active'],
    ['Aisha', 'Khan', 'aisha@example.com', 'pending'],
    ['Carlos', 'Rivera', 'carlos@example.com', 'active'],
    ['Priya', 'Patel', 'priya@example.com', 'inactive'],
    ['Tomas', 'Nguyen', 'tomas@example.com', 'active'],
    ['Hannah', 'Smith', 'hannah@example.com', 'pending'],
    ['Diego', 'Lopez', 'diego@example.com', 'active'],
  ] as const;

  const vols: number[] = [];
  for (const [first, last, email, status] of volunteerSeed) {
    const result = await db.insert(schema.volunteers).values({
      firstName: first, lastName: last, email,
      phone: '555-0100', city: 'Springfield', state: 'IL',
      skills: JSON.stringify(['Event Setup', 'Tutoring']),
      interests: JSON.stringify(['Education', 'Community']),
      languages: JSON.stringify(['English']),
      availability: JSON.stringify({ weekdays: true, weekends: true }),
      status, totalHours: Math.floor(Math.random() * 80),
    }).returning({ id: schema.volunteers.id });
    vols.push((result as any[])[0].id);
  }

  const eventSeed = [
    ['Community Garden Cleanup', '2026-05-15', 'open', 8],
    ['Food Bank Distribution', '2026-05-22', 'open', 12],
    ['Senior Center Visit', '2026-05-29', 'full', 6],
    ['Beach Cleanup', '2026-04-10', 'completed', 20],
    ['Library Book Drive', '2026-06-05', 'draft', 10],
  ] as const;

  const eventIds: number[] = [];
  for (const [name, date, status, req] of eventSeed) {
    const result = await db.insert(schema.events).values({
      name, date, startTime: '09:00', endTime: '13:00',
      location: 'Community Center',
      description: `Help us with ${name.toLowerCase()}.`,
      requiredVolunteers: req, status, coordinator: 'Sarah Johnson',
    }).returning({ id: schema.events.id });
    eventIds.push((result as any[])[0].id);
  }

  for (const eid of eventIds.slice(0, 3)) {
    const shift = await db.insert(schema.shifts).values({
      eventId: eid, name: 'Morning Shift',
      date: '2026-05-15', startTime: '09:00', endTime: '13:00',
      requiredVolunteers: 4, status: 'open',
    }).returning({ id: schema.shifts.id });
    const sid = (shift as any[])[0].id;
    for (const vid of vols.slice(0, 3)) {
      await db.insert(schema.shiftAssignments).values({ shiftId: sid, volunteerId: vid });
    }
  }

  for (const vid of vols.slice(0, 5)) {
    await db.insert(schema.attendance).values({
      volunteerId: vid, eventId: eventIds[3], shiftId: null,
      checkInTime: '2026-04-10T09:00:00Z',
      checkOutTime: '2026-04-10T13:00:00Z',
      totalHours: 4, status: 'present',
    });
  }

  await db.insert(schema.messages).values([
    { scope: 'all', subject: 'Welcome!', body: 'Welcome to VolunteerHub.' },
    { scope: 'event', recipientEventId: eventIds[0], subject: 'Reminder', body: 'See you Saturday!' },
  ]);

  console.log('Seed complete. Admin: admin@vms.local / admin123');
}

main().catch((e) => { console.error(e); process.exit(1); });
