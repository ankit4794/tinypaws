
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function DeliveryCheck() {
  const { user } = useAuth();

  return (
    <div className="text-center p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Choose a delivery location to check product availability and find your nearest store.
      </h2>

      {user ? (
        <div>
          <p className="text-gray-600 mb-4">Your address:</p>
          <p className="text-lg">{user.address?.street}, {user.address?.city}</p>
        </div>
      ) : (
        <div>
          <p className="text-xl text-[#F06543] mb-2">Log in to see your address</p>
          <p className="text-xl mb-4">or</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input 
              placeholder="Enter pin code" 
              className="text-lg h-12"
              maxLength={6}
            />
            <Button className="bg-[#F06543] hover:bg-[#e55835] text-lg h-12 px-8">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
