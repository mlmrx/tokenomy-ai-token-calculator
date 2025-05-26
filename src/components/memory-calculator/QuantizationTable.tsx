
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quantizationData = [
  {
    type: "FP32",
    bits: 32,
    memFactor: "1.000x",
    perfImpact: "Baseline accuracy & memory."
  },
  {
    type: "FP16",
    bits: 16,
    memFactor: "0.500x",
    perfImpact: "~<0.1% Δ. Faster via Tensor Cores."
  },
  {
    type: "BF16",
    bits: 16,
    memFactor: "0.500x",
    perfImpact: "~<0.1% Δ. Better stability than FP16."
  },
  {
    type: "FP8 (E4M3)",
    bits: 8,
    memFactor: "0.250x",
    perfImpact: "~<0.3% Δ with TransformerEngine."
  },
  {
    type: "FP8 (E5M2)",
    bits: 8,
    memFactor: "0.250x",
    perfImpact: "Alternative FP8 format, similar impact."
  },
  {
    type: "INT8 (W8A8 PTQ)",
    bits: 8,
    memFactor: "0.250x",
    perfImpact: "~0.1-1% Δ. Requires calibration (e.g., SmoothQuant)."
  },
  {
    type: "AWQ (4-bit)",
    bits: 4,
    memFactor: "0.125x",
    perfImpact: "~<1% Δ. Activation-aware PTQ."
  },
  {
    type: "GPTQ (4-bit)",
    bits: 4,
    memFactor: "0.125x",
    perfImpact: "~<1% Δ. Layer-wise PTQ."
  }
];

const QuantizationTable: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quantization Impact Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 font-medium">Type</th>
                <th className="text-left py-2 px-3 font-medium">Bits</th>
                <th className="text-left py-2 px-3 font-medium">Mem. Factor</th>
                <th className="text-left py-2 px-3 font-medium">Est. Perf. Impact</th>
              </tr>
            </thead>
            <tbody>
              {quantizationData.map((row, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-3 font-medium">{row.type}</td>
                  <td className="py-2 px-3">{row.bits}</td>
                  <td className="py-2 px-3 font-mono">{row.memFactor}</td>
                  <td className="py-2 px-3 text-muted-foreground">{row.perfImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantizationTable;
