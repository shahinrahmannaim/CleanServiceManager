import { CheckCircle, Percent, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PromotionDisplayProps {
  appliedPromotion?: {
    id: number;
    title: string;
    description: string;
    discountPercentage?: number;
    discountAmount?: number;
  };
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export default function PromotionDisplay({
  appliedPromotion,
  originalAmount,
  discountAmount,
  finalAmount
}: PromotionDisplayProps) {
  if (!appliedPromotion || discountAmount === 0) {
    return null;
  }

  return (
    <Card className="border-green-200 bg-green-50 mt-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-green-800">
                Promotion Applied Automatically!
              </h4>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {appliedPromotion.discountPercentage ? (
                  <div className="flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {appliedPromotion.discountPercentage}% OFF
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ${appliedPromotion.discountAmount} OFF
                  </div>
                )}
              </Badge>
            </div>
            
            <p className="text-sm font-medium text-green-700 mb-3">
              {appliedPromotion.title}
            </p>
            
            {appliedPromotion.description && (
              <p className="text-sm text-green-600 mb-3">
                {appliedPromotion.description}
              </p>
            )}
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Original Price:</span>
                <span className="line-through text-gray-500">
                  ${originalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Discount:</span>
                <span className="text-green-600 font-medium">
                  -${discountAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-semibold text-gray-900">Final Price:</span>
                <span className="font-bold text-green-600 text-lg">
                  ${finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}