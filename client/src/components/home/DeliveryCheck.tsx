import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DeliveryCheck = () => {
  const { toast } = useToast();
  const [pincode, setPincode] = useState("");
  const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckDelivery = async () => {
    // Basic pincode validation for India (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      toast({
        title: "Invalid Pincode",
        description: "Please enter a valid 6-digit pincode",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    
    try {
      // This would be an API call in production
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simple logic for demo: even last digit means deliverable
      const lastDigit = parseInt(pincode.slice(-1));
      setIsDeliverable(lastDigit % 2 === 0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check delivery availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <section className="py-10 px-4 bg-gray-50">
      <div className="container mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Check Delivery Availability</h2>
          <p className="text-gray-600 mb-8 text-center">Enter your pincode to check if we deliver to your area</p>
          
          <div className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
            <Input
              type="text"
              placeholder="Enter Pincode"
              className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
            />
            <Button
              className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
              onClick={handleCheckDelivery}
              disabled={isChecking}
            >
              {isChecking ? "Checking..." : "Check"}
            </Button>
          </div>
          
          {/* Success Message */}
          {isDeliverable === true && (
            <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-md text-center">
              <i className="fas fa-check-circle mr-2"></i> We deliver to your area! Delivery usually takes 2-3 business days.
            </div>
          )}
          
          {/* Error Message */}
          {isDeliverable === false && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-md text-center">
              <i className="fas fa-exclamation-circle mr-2"></i> Sorry, we don't deliver to your area yet. We're expanding soon!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DeliveryCheck;
