import { prisma } from './src/lib/prisma';

async function main() {
  const barbers = await prisma.barber.findMany();
  for (const barber of barbers) {
    if (barber.workingHours) {
      let hours = typeof barber.workingHours === 'string' ? JSON.parse(barber.workingHours) : barber.workingHours;
      let changed = false;
      for (const day of ["0", "1", "2", "3", "4", "5", "6"]) {
        if (hours[day] && hours[day].end === "18:00") {
          hours[day].end = "21:00";
          changed = true;
        }
      }
      if (changed) {
        await prisma.barber.update({
          where: { id: barber.id },
          data: { workingHours: hours }
        });
        console.log(`Updated hours for barber: ${barber.name}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
