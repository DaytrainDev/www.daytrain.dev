import Image from "next/image";

export default function Footer() {
  const linkClass = 'p-2';

  return (
    <footer className="flex-col justify-center w-full pb-4">
      <nav className="flex mt-6 justify-center w-full text-xl" dir="utd">
        <div className={linkClass}>
          <a rel="noopener noreferrer" href={'https://github.com/DaytrainDev/www.daytrain.dev'} target="_blank">
            <Image
              src={"/github.png"}
              alt={'See source code on GitHub'}
              width={51}
              height={51}
            />
          </a>
        </div>
      </nav>
      <div className={'text-center'}>
        <p className="text-black dark:text-white">© {new Date().getFullYear()}, Daytrain Dev</p>
      </div>
    </footer>
  )
}
