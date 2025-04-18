import { Helmet } from "react-helmet";

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | TinyPaws</title>
        <meta name="description" content="TinyPaws privacy policy explains how we collect, use, and protect your personal information when you use our website and services." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: June 15, 2023</p>

          <div className="prose max-w-none">
            <p>
              At TinyPaws, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">1. Information We Collect</h2>
            
            <h3 className="mt-6 mb-3 text-xl font-medium">Personal Data</h3>
            <p>
              When you create an account, place an order, or subscribe to our newsletter, we may collect personally identifiable information, such as:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Payment information (we do not store complete credit card information)</li>
              <li>Pet information (type, breed, age, etc.)</li>
            </ul>

            <h3 className="mt-6 mb-3 text-xl font-medium">Non-Personal Data</h3>
            <p>
              When you visit our website, our servers may automatically log standard data provided by your web browser. This may include:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Your device's IP address</li>
              <li>Browser type and version</li>
              <li>Pages you visit</li>
              <li>Time and date of your visit</li>
              <li>Time spent on each page</li>
              <li>Other details about your visit</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">2. How We Use Your Information</h2>
            <p>
              We may use the information we collect in various ways, including to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Process and fulfill your orders</li>
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website experience</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Communicate with you, either directly or through one of our partners, for customer service, updates, and other website related communications</li>
              <li>Send you emails and newsletters</li>
              <li>Find and prevent fraud</li>
              <li>Process your payments and refunds</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
            </p>
            <p>
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
            </p>
            <p>
              Types of cookies we use:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Essential cookies:</strong> Necessary for the operation of our website</li>
              <li><strong>Analytical/performance cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our website</li>
              <li><strong>Functionality cookies:</strong> Used to recognize you when you return to our website</li>
              <li><strong>Targeting cookies:</strong> Record your visit to our website, the pages you have visited and the links you have followed</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">4. Third-Party Disclosure</h2>
            <p>
              We may share your information with third parties in certain situations:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Business Partners:</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
              <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in response to valid requests by public authorities.</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">5. Data Retention</h2>
            <p>
              We will retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our policies.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">6. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our website is at your own risk.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">7. Your Data Protection Rights</h2>
            <p>
              You have the following data protection rights:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The right to access, update, or delete the information we have on you.</li>
              <li>The right of rectification - You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
              <li>The right to object - You have the right to object to our processing of your Personal Data.</li>
              <li>The right of restriction - You have the right to request that we restrict the processing of your personal information.</li>
              <li>The right to data portability - You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
              <li>The right to withdraw consent - You also have the right to withdraw your consent at any time where we relied on your consent to process your personal information.</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">8. Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">10. Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
            </p>
            <div className="mt-2">
              <p><strong>Email:</strong> privacy@tinypaws.in</p>
              <p><strong>Phone:</strong> +91 1234567890</p>
              <p><strong>Address:</strong> 42, Linking Road, Bandra West, Mumbai - 400050</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;
