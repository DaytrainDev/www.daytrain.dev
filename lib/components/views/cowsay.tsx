'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';

const cowStyles = [
  { value: 'default', label: 'Default Cow' },
  { value: 'tux', label: 'Tux' },
  { value: 'sheep', label: 'Sheep' },
  { value: 'dragon', label: 'Dragon' },
];

export function CowsayUI() {
  const [message, setMessage] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [thinking, setThinking] = useState(false);
  const [output, setOutput] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/cowsay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          style: selectedStyle,
          thinking,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.text();
      setOutput(data);
    } catch (error) {
      console.error('Error:', error);
      setOutput('Error generating cowsay message');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-4">
        <div className="space-y-4">
          <Input
            label="Message"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          
          <Select
            label="Cow Style"
            options={cowStyles}
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          />
          
          <Toggle
            label="Thinking Mode"
            checked={thinking}
            onToggle={() => setThinking(!thinking)}
          />
          
          <Button 
            onClick={handleSubmit}
            disabled={!message}
            className="w-full"
          >
            Generate Cowsay
          </Button>
        </div>
      </Card>

      {output && (
        <Card className="font-mono whitespace-pre overflow-x-auto">
          {output}
        </Card>
      )}
    </div>
  );
}
