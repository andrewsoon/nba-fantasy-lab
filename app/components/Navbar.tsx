"use client"
import Image from "next/image"
import { useRouter } from "next/navigation"

const Navbar: React.FC = () => {
  const router = useRouter()
  return (
    <div className="flex flex-row p-6 items-center justify-between">
      <button className="cursor-pointer" onClick={() => router.push('/')}>
        <Image
          src="/NBAFantasyLabLogo.svg"
          alt="NBAFantasyLabLogo"
          width={100} // original image width
          height={100} // original image height
          className="h-5 sm:h-10 md:h-15 w-auto"
        />

      </button>
      {/* <div className="flex flex-row gap-6">
        <button className={navlinkStyle} onClick={() => router.push('/')}>
          Player Stats
        </button>
        <button className={navlinkStyle} onClick={() => router.push('/compare')}>
          Compare Teams
        </button>
      </div> */}
    </div >
  )
}

const navlinkStyle = "text-lg font-semibold hover:text-zinc-800 dark:hover:text-zinc-300 cursor-pointer"

export default Navbar