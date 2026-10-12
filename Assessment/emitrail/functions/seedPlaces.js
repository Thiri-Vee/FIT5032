const admin = require('firebase-admin')

admin.initializeApp({
  projectId: 'emitrail-4c7e3'
})

const db = admin.firestore()


// Demonstration data for BR D.3
// Ratings and distances are illustrative, not live measurements.
const places = [
  ['Capital City Trail', 'Cycling trail', 'Melbourne', 29, 4.6],
  ['Royal Botanic Gardens', 'Park', 'Melbourne', 3, 4.8],
  ['Albert Park Lake', 'Walking trail', 'Albert Park', 5, 4.5],
  ['Yarra Bend Park', 'Park', 'Kew', 6, 4.7],
  ['St Kilda Beach', 'Walking trail', 'St Kilda', 4, 4.6],
  ['Princes Park', 'Park', 'Carlton North', 3, 4.4],
  ['Merri Creek Trail', 'Cycling trail', 'Northcote', 21, 4.7],
  ['Gardiners Creek Trail', 'Cycling trail', 'Ashburton', 17, 4.5],
  ['Fitzroy Gardens', 'Park', 'East Melbourne', 2, 4.6],
  ['Flagstaff Gardens', 'Park', 'West Melbourne', 2, 4.3],
  ['Carlton Gardens', 'Park', 'Carlton', 2, 4.7],
  ['Jells Park', 'Park', 'Wheelers Hill', 5, 4.5],
  ['Dandenong Creek Trail', 'Cycling trail', 'Wantirna', 20, 4.4],
  ['Maribyrnong River Trail', 'Cycling trail', 'Footscray', 25, 4.6],
  ['Brimbank Park', 'Park', 'Keilor East', 5, 4.5],
  ['Monash Sport', 'Sporting facility', 'Clayton', 1, 4.4],
  ['Melbourne Sports Centre', 'Sporting facility', 'Albert Park', 2, 4.5],
  ['Docklands Sports Courts', 'Sporting facility', 'Docklands', 1, 4.2],
  ['Caulfield Park', 'Park', 'Caulfield North', 3, 4.4],
  ['Bayside Coastal Trail', 'Walking trail', 'Brighton', 10, 4.6],
  ['Edinburgh Gardens', 'Park', 'Fitzroy North', 3, 4.7],
  ['Karkarook Park', 'Park', 'Heatherton', 4, 4.5],
  ['Westgate Park', 'Park', 'Port Melbourne', 3, 4.3],
  ['Jells Park Walking Loop', 'Walking trail', 'Wheelers Hill', 3, 4.4],
]

async function seedPlaces() {
  const batch = db.batch()

  places.forEach((place, index) => {
    const id = `place${String(index + 1).padStart(3, '0')}`
    const ref = db.collection('places').doc(id)

    batch.set(ref, {
      name: place[0],
      category: place[1],
      suburb: place[2],
      distanceKm: place[3],
      rating: place[4],
    })
  })

  await batch.commit()
  console.log(`Successfully seeded ${places.length} places.`)
}

seedPlaces().catch((error) => {
  console.error('Seeding failed:', error)
  process.exitCode = 1
})
