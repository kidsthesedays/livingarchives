// Declare the type Point, used for points
type Point = {
    id: number,
    position: number,
    name: string,
    adress: string,
    latitude: number,
    longitude: number
}

// Array of points of interest in Copenhagen
export const points: Array<Point> = [
    {
        id: 1,
        position: 1,
        name: 'First home whilst in exhibition',
        adress: 'Vestergade 12, 1456 København K',
        latitude: 55.67781,
        longitude: 12.57032
    },
    {
        id: 2,
        position: 2,
        name: 'The Exhibition Space: Tivoli Gardens',
        adress: 'Vesterbrogade 3, 1630 København V',
        latitude: 55.67368,
        longitude: 12.56814
    },
    {
        id: 3,
        position: 3,
        name: 'The School',
        adress: 'Nørre Farimagsgade 51, 1364 København K',
        latitude: 55.68396,
        longitude: 12.56684
    },
    {
        id: 4,
        position: 4,
        name: 'The Vanished final address of residence',
        adress: 'Vodroffsvej 25, 1900 Frederiksberg C',
        latitude: 55.67684,
        longitude: 12.55357
    },
    {
        id: 5,
        position: 5,
        name: 'Old St Joseph\'s Hospital',
        adress: '',
        latitude: 55.68678,
        longitude: 12.55287
    },
    {
        id: 6,
        position: 6,
        name: 'Final resting place? Hellig Kors Kirke',
        adress: 'Kapelvej 38, 2200 København N',
        latitude: 55.68766,
        longitude: 12.55151
    }
]

