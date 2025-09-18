import React, { useState, useEffect, useCallback } from 'react'
import { Star } from 'lucide-react'
import { 
    Carousel, 
    CarouselContent, 
    CarouselItem, 
    CarouselPrevious, 
    CarouselNext 
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import './testimonial.css'

export default function TestimonialCarousel() {
    const [api, setApi] = useState()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    const testimonials = [
        {
            id: 1,
            name: "Rahul S.",
            designation: "Private Seller",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            review: "Selling a car usually feels like a headache, but Amacar completely changed that experience. The auction process was transparent and I received multiple competitive offers. Great platform!"
        },
        {
            id: 2,
            name: "Priya K.",
            designation: "Verified User",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            review: "I can't believe how quick the process was. Within 24 hours, I had multiple offers and sold my car for a great price. The team was helpful throughout. My go-to recommendation now."
        },
        {
            id: 3,
            name: "Arjun R.",
            designation: "Car Enthusiast",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            review: "As someone who has sold cars through classified ads before, I was amazed by how streamlined Amacar's process is. No haggling, no time wasters. I couldn't have asked for an easier way."
        },
        {
            id: 4,
            name: "Sneha T.",
            designation: "Happy Seller",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            review: "Amacar really lives up to its promise of a win-win solution. The dealers were genuine, the process was smooth, and I got a fair price for my vehicle. Definitely worth using again."
        }
    ]

    useEffect(() => {
        if (!api) return

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    const scrollTo = useCallback((index) => {
        api?.scrollTo(index)
    }, [api])

    return (
        <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-white">
            <div className="max-w-6xl mx-auto p-[1rem]">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                        What Our <span className="text-[#f6851f]">Customers</span> Say
                    </h2>
                    <div className="w-20 h-1 bg-[#f6851f] mx-auto rounded-full"></div>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    <Carousel
                        setApi={setApi}
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        plugins={[
                            Autoplay({
                                delay: 4000,
                                stopOnInteraction: false,
                                stopOnMouseEnter: true,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {testimonials.map((testimonial, index) => (
                                <CarouselItem 
                                    key={testimonial.id} 
                                    className="pl-2 md:pl-4 md:basis-1/2"
                                >
                                    <div className="group relative bg-gradient-to-br from-white to-slate-50 rounded-3xl p-8 transition-all class-for-shadow duration-500 hover:scale-105 border border-slate-200/50 overflow-hidden h-full">
                                        {/* Decorative background pattern */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full translate-y-12 -translate-x-12"></div>

                                        {/* Quote icon */}
                                        <div className="absolute top-4 right-4 text-blue-200/50 text-4xl font-serif">"</div>

                                        {/* Avatar placeholder */}
                                        <div className="flex justify-center mb-6 relative z-10">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-slate-600">
                                                        {testimonial.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name and Designation */}
                                        <div className="text-center mb-6 relative z-10">
                                            <h3 className="font-bold text-slate-900 text-xl mb-1">
                                                {testimonial.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 font-medium">
                                                {testimonial.designation}
                                            </p>
                                        </div>

                                        {/* Star Rating */}
                                        <div className="flex justify-center space-x-1 mb-6 relative z-10">
                                            {[...Array(testimonial.rating)].map((_, starIndex) => (
                                                <Star
                                                    key={starIndex}
                                                    className="w-5 h-5 text-yellow-400 fill-current drop-shadow-sm"
                                                />
                                            ))}
                                        </div>

                                        {/* Review */}
                                        <blockquote className="text-slate-700 text-center leading-relaxed text-base relative z-10 italic line-clamp-3">
                                            {testimonial.review}
                                        </blockquote>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Arrows */}
                        <CarouselPrevious className="absolute left-6 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white rounded-full p-4 transition-all class-for-shadow duration-300 border border-slate-200 hover:bg-slate-50 hover:border-orange-300 hover:text-orange-600" />
                        <CarouselNext className="absolute right-6 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white rounded-full p-4 transition-all class-for-shadow duration-300 border border-slate-200 hover:bg-slate-50 hover:border-orange-300 hover:text-orange-600" />
                    </Carousel>

                    {/* Dots Navigation */}
                    <div className="flex justify-center space-x-2 mt-8">
                        {Array.from({ length: count }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === current - 1
                                        ? 'bg-orange-600 scale-125'
                                        : 'bg-slate-300 hover:bg-slate-400'
                                }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}