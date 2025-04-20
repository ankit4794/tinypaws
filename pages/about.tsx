import { Helmet } from "react-helmet";

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About TinyPaws | Premium Pet Products</title>
        <meta name="description" content="Learn about TinyPaws, India's premier online pet store offering high-quality products for dogs, cats, and small animals." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Banner */}
        <div className="bg-gray-50 rounded-xl overflow-hidden mb-12">
          <div className="relative h-80">
            <img 
              src="https://images.unsplash.com/photo-1591946614720-90a587da4a36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="TinyPaws Team with Pets" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white">About TinyPaws</h1>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-700 mb-4">
                Founded in 2018, TinyPaws began with a simple mission: to provide high-quality products that enhance the lives of pets and their owners. What started as a small passion project by a group of pet enthusiasts has grown into one of India's most trusted pet supply destinations.
              </p>
              <p className="text-gray-700 mb-4">
                Our journey began when our founder, Arjun Sharma, struggled to find premium quality products for his dog, Max. Frustrated with the limited options available in the market, he envisioned a one-stop solution for all pet needs – a place where quality, convenience, and care would converge.
              </p>
              <p className="text-gray-700">
                Today, TinyPaws offers thousands of carefully curated products for dogs, cats, and small animals. We work directly with manufacturers and brands that share our commitment to quality, sustainability, and animal welfare. Our team consists of passionate pet lovers who understand that pets are family and deserve nothing but the best.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581888227599-779811939961?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                alt="Happy pets" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="bg-gray-50 p-8 rounded-xl mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Mission & Values</h2>
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xl font-medium mb-8">
              "To enrich the relationship between pets and their humans by providing premium products, expert guidance, and exceptional service."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-3xl text-black">
                  <i className="fas fa-paw"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Quality First</h3>
                <p className="text-gray-600">We thoroughly vet every product to ensure it meets our high standards for quality, safety, and value.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-3xl text-black">
                  <i className="fas fa-heart"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Pet-Centric</h3>
                <p className="text-gray-600">Every decision we make is guided by what's best for pets and their well-being.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-4 text-3xl text-black">
                  <i className="fas fa-leaf"></i>
                </div>
                <h3 className="text-xl font-bold mb-2">Sustainability</h3>
                <p className="text-gray-600">We're committed to reducing our environmental pawprint through eco-friendly products and practices.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Meet Our Team</h2>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            TinyPaws is powered by a team of passionate pet lovers and industry experts dedicated to improving the lives of pets and their humans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="Arjun Sharma - Founder & CEO" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xl">Arjun Sharma</h3>
              <p className="text-gray-600">Founder & CEO</p>
              <p className="text-gray-500 text-sm mt-2">Pet Parent to Max (Golden Retriever)</p>
            </div>
            <div className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="Priya Desai - Head of Product" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xl">Priya Desai</h3>
              <p className="text-gray-600">Head of Product</p>
              <p className="text-gray-500 text-sm mt-2">Pet Parent to Luna (Siamese Cat)</p>
            </div>
            <div className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1961&q=80" 
                  alt="Neha Kapoor - Veterinary Consultant" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xl">Dr. Neha Kapoor</h3>
              <p className="text-gray-600">Veterinary Consultant</p>
              <p className="text-gray-500 text-sm mt-2">Pet Parent to Charlie (Beagle)</p>
            </div>
            <div className="text-center">
              <div className="rounded-full overflow-hidden w-48 h-48 mx-auto mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="Vikram Mehta - Operations Manager" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-xl">Vikram Mehta</h3>
              <p className="text-gray-600">Operations Manager</p>
              <p className="text-gray-500 text-sm mt-2">Pet Parent to Coco (Labrador) & Milo (Persian Cat)</p>
            </div>
          </div>
        </div>

        {/* Store Locations */}
        <div className="bg-gray-50 p-8 rounded-xl mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Retail Locations</h2>
          <p className="text-center text-gray-700 mb-8 max-w-3xl mx-auto">
            While we started as an online retailer, we're proud to have expanded to physical stores where you can experience our products firsthand and get personalized advice from our team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Mumbai - Bandra</h3>
              <p className="text-gray-600 mb-4">42, Linking Road, Bandra West, Mumbai - 400050</p>
              <p className="mb-1"><i className="fas fa-phone-alt mr-2 text-gray-500"></i> +91 9876543210</p>
              <p className="mb-1"><i className="fas fa-clock mr-2 text-gray-500"></i> 10:00 AM - 8:00 PM (All days)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Delhi - Saket</h3>
              <p className="text-gray-600 mb-4">Shop No. 15, DLF Place Mall, Saket, New Delhi - 110017</p>
              <p className="mb-1"><i className="fas fa-phone-alt mr-2 text-gray-500"></i> +91 9876543211</p>
              <p className="mb-1"><i className="fas fa-clock mr-2 text-gray-500"></i> 11:00 AM - 9:00 PM (All days)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-2">Bangalore - Indiranagar</h3>
              <p className="text-gray-600 mb-4">123, 100 Feet Road, Indiranagar, Bangalore - 560038</p>
              <p className="mb-1"><i className="fas fa-phone-alt mr-2 text-gray-500"></i> +91 9876543212</p>
              <p className="mb-1"><i className="fas fa-clock mr-2 text-gray-500"></i> 10:00 AM - 8:00 PM (All days)</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                    alt="Testimonial Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Rahul K.</h4>
                  <div className="flex">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star-half-alt text-yellow-400 text-sm"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"TinyPaws has been my go-to for all my pet needs for over 2 years now. Their products are of exceptional quality and their customer service is top-notch. My dog's health has noticeably improved since we switched to their premium food range."</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                    alt="Testimonial Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Priya S.</h4>
                  <div className="flex">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"What sets TinyPaws apart is their attention to detail and personalized recommendations. They suggested a harness for my hyperactive puppy that has been a game-changer for our walks. Fast delivery and excellent packaging too!"</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <img 
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1961&q=80" 
                    alt="Testimonial Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">Ananya J.</h4>
                  <div className="flex">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"As a first-time pet parent, I had countless questions. The TinyPaws team was incredibly patient and helpful, guiding me through everything I needed. Their blog and care guides have been invaluable resources. Highly recommend!"</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-black text-white p-12 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="mb-6 max-w-2xl mx-auto">Have questions or want to learn more about TinyPaws? We'd love to hear from you! Reach out to our friendly team for assistance.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/contact" className="bg-white text-black font-medium py-3 px-6 rounded-md hover:bg-gray-100 transition">
              Contact Us
            </a>
            <a href="tel:+911234567890" className="bg-transparent border border-white text-white font-medium py-3 px-6 rounded-md hover:bg-white hover:text-black transition">
              <i className="fas fa-phone-alt mr-2"></i> Call Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
