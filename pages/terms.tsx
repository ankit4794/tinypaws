import { Helmet } from "react-helmet";

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | TinyPaws</title>
        <meta name="description" content="Read the terms and conditions that govern your use of TinyPaws website and services." />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: June 15, 2023</p>

          <div className="prose max-w-none">
            <p>
              Welcome to TinyPaws! These terms and conditions outline the rules and regulations for the use of TinyPaws' website. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use TinyPaws' website if you do not accept all of the terms and conditions stated on this page.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">1. Definitions</h2>
            <p>
              The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>"Client", "You" and "Your" refers to you, the person accessing this website and accepting the Company's terms and conditions.</li>
              <li>"The Company", "Ourselves", "We", "Our" and "Us", refers to TinyPaws.</li>
              <li>"Party", "Parties", or "Us", refers to both the Client and ourselves, or either the Client or ourselves.</li>
            </ul>
            <p>
              All terms refer to the offer, acceptance, and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, whether by formal meetings of a fixed duration, or any other means, for the express purpose of meeting the Client's needs in respect of provision of the Company's stated services/products, in accordance with and subject to, prevailing law of India.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">2. License to Use Website</h2>
            <p>
              Unless otherwise stated, TinyPaws and/or its licensors own the intellectual property rights for all material on TinyPaws. All intellectual property rights are reserved. You may view and/or print pages from the website for your own personal use subject to restrictions set in these terms and conditions.
            </p>
            <p>
              You must not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Republish material from this website</li>
              <li>Sell, rent or sub-license material from the website</li>
              <li>Reproduce, duplicate or copy material from the website</li>
              <li>Redistribute content from TinyPaws (unless content is specifically made for redistribution)</li>
            </ul>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">3. User Account</h2>
            <p>
              If you create an account on the website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify TinyPaws of any unauthorized uses of your account or any other breaches of security. TinyPaws will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">4. Products and Services</h2>
            <p>
              All products and services are subject to availability. We reserve the right to discontinue any products or services at any time. Prices are subject to change without notice. We shall not be liable to you or to any third-party for any modification, price change, suspension, or discontinuance of the product or service.
            </p>
            <p>
              Colors and appearances of products may vary from those shown on the website due to display settings and individual device capabilities.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">5. Ordering and Payment</h2>
            <p>
              By placing an order with us, you are making an offer to purchase products. We reserve the right to refuse or cancel your order at any time for reasons including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Product or services availability</li>
              <li>Errors in the description or prices of products</li>
              <li>Error in your order</li>
              <li>Suspicion of fraudulent activity</li>
            </ul>
            <p>
              We accept various payment methods as indicated on our website. All payments are processed securely through our payment partners. We do not store complete credit card information on our servers.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">6. Shipping and Delivery</h2>
            <p>
              We ship products to most areas in India. Delivery times vary depending on your location and the products ordered. We are not responsible for delays in delivery caused by customs, natural disasters, or other circumstances beyond our control.
            </p>
            <p>
              Risk of loss and title for items purchased from TinyPaws pass to you upon delivery of the items to the carrier.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">7. Returns and Refunds</h2>
            <p>
              We offer a 7-day return policy for most products. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
            </p>
            <p>
              Certain types of items cannot be returned, such as perishable goods (like food or treats), personalized items, and personal care goods. We also do not accept returns for hazardous materials, flammable liquids, or gases.
            </p>
            <p>
              To initiate a return, please contact our customer service team. If your return is accepted, we will send you instructions on how and where to send your package. Items returned without prior approval may not be accepted.
            </p>
            <p>
              Refunds will be processed once we receive and inspect the returned item. Refunds will be credited to the original payment method. Processing time for refunds may vary depending on your payment provider.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">8. User-Generated Content</h2>
            <p>
              If you post, upload, or otherwise share any content on our website (such as reviews, comments, or photos), you grant TinyPaws a non-exclusive, royalty-free, perpetual, irrevocable, and fully sublicensable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content throughout the world in any media.
            </p>
            <p>
              You represent and warrant that you own or otherwise control all of the rights to the content that you post; that the content is accurate; that use of the content you supply does not violate these Terms and Conditions and will not cause injury to any person or entity.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">9. Disclaimer of Warranties</h2>
            <p>
              The products and services offered on this website are provided "as is" and "as available" without any warranties of any kind, either express or implied. TinyPaws disclaims all warranties, including but not limited to, implied warranties of merchantability and fitness for a particular purpose.
            </p>
            <p>
              TinyPaws does not warrant that the website will be uninterrupted or error-free, that defects will be corrected, or that the website or the server that makes it available are free of viruses or other harmful components.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">10. Limitation of Liability</h2>
            <p>
              TinyPaws shall not be liable for any damages of any kind arising from the use of this website, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.
            </p>
            <p>
              The maximum liability of TinyPaws arising out of or in connection with the website or your use of the products or services, regardless of the cause of action (whether in contract, tort, breach of warranty, or otherwise), will not exceed the purchase price of the product or service.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless TinyPaws, its officers, directors, employees, agents, and suppliers, from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) that such parties may incur as a result of or arising from your violation of these Terms and Conditions.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">12. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes relating to these Terms and Conditions shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">13. Changes to Terms</h2>
            <p>
              TinyPaws reserves the right to modify these Terms and Conditions at any time. Changes and clarifications will take effect immediately upon their posting on the website. If we make material changes to this policy, we will notify you that it has been updated, so that you are aware of what information we collect, how we use it, and under what circumstances, if any, we use and/or disclose it.
            </p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">14. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-2">
              <p><strong>Email:</strong> legal@tinypaws.in</p>
              <p><strong>Phone:</strong> +91 1234567890</p>
              <p><strong>Address:</strong> 42, Linking Road, Bandra West, Mumbai - 400050</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;
