// src/components/LandingPage/FeatureGrid.tsx

import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { Zap, Lock, Database, FileText } from 'lucide-react'; 

interface Feature {
    icon: React.ElementType;
    title: string;
    description: string;
}

const features: Feature[] = [
  { icon: Zap, title: "Hyper-Scalable Speed", description: "BlockDAG parallelism ensures instant, verifiable transactions—faster than any linear blockchain or traditional cloud." },
  { icon: Lock, title: "Client-Side Encryption (AES)", description: "Data is encrypted on your device *before* it hits the ledger. Only authorized roles can decrypt. Zero-trust security." },
  { icon: Database, title: "100% On-Chain State", description: "All business records (items, customers, transactions) are decentralized, eliminating single points of failure like SQL servers." },
  { icon: FileText, title: "Verifiable Reporting", description: "Managers generate tamper-proof financial reports and market graphs directly from immutable on-chain data." },
];

const FeatureGrid: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-gray-950">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center text-white mb-4">Unbreakable Records. Unstoppable Performance.</h2>
        <p className="text-lg text-gray-400 text-center mb-16 max-w-3xl mx-auto">
            Leveraging BlockDAG for speed and advanced cryptography for security.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-gray-900 border-gray-800 hover:border-cyan-400 transition-all duration-300 shadow-xl group"
            >
              <CardHeader className="flex flex-col items-start space-y-4">
                <div className="p-3 rounded-xl bg-cyan-900/40 border border-cyan-500/50">
                    <feature.icon className="w-6 h-6 text-cyan-400 group-hover:rotate-6 transition-transform" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;