'use client';
import { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRef, useState } from 'react';

interface ImageResult {
  url?: string;
  revised_prompt?: string;
  error?: string;
}

interface ImaGenUIProps {
  handleSubmit: (
    prompt: string,
    user: string,
    size?: '256x256' | '512x512' | '1024x1024',
    n?: number
  ) => Promise<ImageResult | undefined>;
}

export function ImaGenUI({ handleSubmit }: ImaGenUIProps) {
  const session = useSession();
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    const prompt = promptRef.current?.value?.trim();
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = session?.data?.user?.email || 'anonymous';
      const response = await handleSubmit(prompt, userId);

      if (response?.error) {
        setError(response.error);
      } else if (response?.url) {
        setImageUrl(response.url);
        if (promptRef.current) {
          promptRef.current.value = '';
        }
      } else {
        setError('No image was generated');
      }
    } catch {
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (session.status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  if (session.status !== 'authenticated') {
    return (
      <div className="p-4">
        <div>You need to be logged in to use ImaGen.</div>
        <div className="mt-2">
          <a href="/" className="text-blue-400 hover:underline">
            ...back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4">
      <h1 className="text-2xl border-slate-100 border-2 border-dashed p-2">
        ImaGen
      </h1>

      {error && (
        <div
          role="alert"
          className="w-full max-w-lg p-4 text-white bg-red-500 rounded"
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="w-[512px] h-[512px] flex items-center justify-center bg-slate-800 rounded">
          <div className="text-xl">Generating...</div>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="border-2 border-slate-600 rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt="Generated image"
            width={512}
            height={512}
            priority
          />
        </div>
      )}

      <div className="w-full max-w-lg">
        <textarea
          ref={promptRef}
          className="w-full bg-slate-800 border-2 border-slate-600 rounded p-2 text-white resize-none"
          rows={4}
          placeholder="Describe the image you want to generate..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleGenerate();
            }
          }}
        />
      </div>

      <button
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate'}
      </button>
    </div>
  );
}

interface ImaGenSessionProps {
  session: Session | null;
  handleSubmit: (
    prompt: string,
    user: string,
    size?: '256x256' | '512x512' | '1024x1024',
    n?: number
  ) => Promise<ImageResult | undefined>;
}

export function ImaGenSession({ session, handleSubmit }: ImaGenSessionProps) {
  return (
    <SessionProvider session={session}>
      <ImaGenUI handleSubmit={handleSubmit} />
    </SessionProvider>
  );
}
