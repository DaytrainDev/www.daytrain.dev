"use client";
import { useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';

interface InputField {
  id: string;
  name: string;
  prompt: string;
  type?: string;
}

interface GenericIOUIProps {
  inputs: InputField[];
  action: string;
  label?: string;
  outputPrefix?: string;
  outputSuffix?: string;
  method?: string;
}

export function GenericIOUI({
  inputs,
  action,
  label = 'Submit',
  outputPrefix = '',
  outputSuffix = '',
  method = 'POST'
}: GenericIOUIProps) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(inputs.map(input => [input.id, '']))
  );
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (id: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch(action, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setOutput(data.output || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {inputs.map((input) => (
          <div key={input.id} className="space-y-2">
            <label htmlFor={input.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {input.prompt}
            </label>
            <Input
              id={input.id}
              name={input.name}
              type={input.type || 'text'}
              value={values[input.id]}
              onChange={(e) => handleInputChange(input.id, e.target.value)}
              className="w-full"
              disabled={loading}
            />
          </div>
        ))}
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : label}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {output && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {outputPrefix}{output}{outputSuffix}
            </pre>
          </div>
        )}
      </form>
    </Card>
  );
}

interface GenericIOUISessionProps extends GenericIOUIProps {
  session: any;
}

export function GenericIOUISession({ session, ...props }: GenericIOUISessionProps) {
  return (
    <SessionProvider session={session}>
      <GenericIOUI {...props} />
    </SessionProvider>
  );
}