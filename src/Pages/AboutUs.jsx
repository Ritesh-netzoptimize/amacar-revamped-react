import React from 'react'
import AboutUsHero from '@/components/AboutUs/AboutUsHero/AboutUsHero.jsx'
import WhoWeAre from '@/components/AboutUs/WhoWeAre/WhoWeAre.jsx'
import HowAmacarWorks from '@/components/AboutUs/HowAmacarWorks/HowAmacarWorks.jsx'
import OurValues from '@/components/AboutUs/OurValues/OurValues.jsx'
import TrustedPartners from '@/components/AboutUs/TrustedPartners/TrustedPartners.jsx'

export default function AboutUs() {
    return (
        <>
            <AboutUsHero />
            <WhoWeAre />
            <HowAmacarWorks />
            <OurValues />
            <TrustedPartners />
        </>
    )
}
