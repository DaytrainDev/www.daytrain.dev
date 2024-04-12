import Image from "next/image";
import { headers } from 'next/headers'

const sheet = {
  name: 'Hob',
  playerName: 'Daytrain',
  species: {
    id: 'human',
    subrace: 'Homo sapien',
  },
  classes: [{
    id: 'Commoner',
    subclass: 'N/A',
    level: 1,
  }],
  background: {
    id: 'N/A',
  },
}

export default function PlayerDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      
      {/* Add player profile */}
      <div className="flex items-center justify-center">
        <Image src="/path/to/player-avatar.png" alt="Player Avatar" width={100} height={100} />
        <div className="ml-4">
          <h1 className="text-2xl font-bold">Player Name</h1>
          <p className="text-gray-500"></p>
        </div>
      </div>

      {/* Add player stats */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Stats</h2>
        <div className="flex">
          <div className="mr-4">
            <p className="text-gray-500">HP</p>
            <p>10/10</p>
          </div>
          <div className="mr-4">
            <p className="text-gray-500">AC</p>
            <p>10</p>
          </div>
          <div className="mr-4">
            <p className="text-gray-500">SP</p>
            <p>0/0</p>
          </div>
          {/* Add more stats */}
        </div>
      </div>

      {/* Add player inventory */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Inventory</h2>
        <ul>
          <li>Quarterstaff</li>
          {/* Add more items */}
        </ul>
      </div>

      {/* Add player actions */}
      <div className="mt-8">
        <h2 className="text-xl font-bold">Actions</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Attack</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded ml-4">Heal</button>
        {/* Add more actions */}
      </div>

    </main>
  );
}
