import React from 'react'

const About = ({ state }) => {
    // Scroll to the top of the page
    document.getElementById('mount').scrollTop = 0

    return (
        <div className='about'>
            <p><b>Finding Alberta was created by Temi Odumosu, Maria Engberg and Doris HB (Sebastian Bengtegård and Johannes Karlsson)</b></p>
            <p>The Finding Alberta experience was created as part of the research project Living Archives at Malmö University. Finding Alberta is part of several design-driven research projects that use site specific augmented reality media to convey stories of colonialism in Denmark and beyond.</p>

            <h5>Acknowledgements:</h5>
            <ul>
                <li>Rikke Andreassen (Roskilde University, Roskilde)</li>
                <li>Mathias Bruun (Det Kongelige Vajsenhus School, Copenhagen)</li>
                <li>Ronald Burns (Visual Artist, Copenhagen)</li>
                <li>Florence Odumosu (Actor, London)</li>
                <li>Jakob Parby (City Museum, Copenhagen)</li>
                <li>Heidi Pfeffer (Nakskov Local History Archive, Nakskov)</li>
            </ul>

            <h5>Collections:</h5>
            <ul>
                <li>City Museum of Copenhagen</li>
                <li>Royal Library of Denmark</li>
                <li>Nakskov Local History Archive</li>
                <li>National Museum of Denmark</li>
            </ul>

            <h5>Contact:</h5>
            <ul>
                <li>temi.odumosu@mah.se</li>
                <li>maria.engberg@mah.se</li>
                <li>kontakt@doris.tech</li>
            </ul>
        </div>
    )
}

export default About
