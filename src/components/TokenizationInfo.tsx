
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, FileCode, AlertCircle } from "lucide-react";
import { getTokenizationInfo } from "@/lib/modelData";
import { getCompanyFromModel, getModelTheme } from "@/lib/modelThemes";

interface TokenizationInfoProps {
  model: string;
  tokens: number;
}

const TokenizationInfo: React.FC<TokenizationInfoProps> = ({ model, tokens }) => {
  const tokenInfo = getTokenizationInfo(model);
  const company = getCompanyFromModel(model);
  const modelTheme = getModelTheme(model);
  
  // If no token info is available, show a default message
  if (!tokenInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Tokenization Info Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed tokenization information is not available for this model.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileCode className="h-5 w-5" style={{color: modelTheme.primary}} />
          Tokenization Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Company</div>
            <div className="font-medium">{company}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Scheme</div>
            <div className="font-medium">{tokenInfo.scheme || "BPE"}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Vocabulary Size</div>
            <div className="font-medium">Unknown</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Token Overhead</div>
            <div className="font-medium">{tokenInfo.overhead || "~2%"}</div>
          </div>
        </div>

        <div className="bg-muted/50 p-3 rounded-lg border" style={{borderColor: modelTheme.border}}>
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Final Token Count:</span> {tokens.toLocaleString()}
              </p>
              <p className="mt-1">
                Token estimates are approximations and may vary slightly from the exact count used by the model.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenizationInfo;
