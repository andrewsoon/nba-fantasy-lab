import { PlayersTable } from "./PlayersTable";

export default function Home() {
  return (
    <div className="flex justify-center font-sans">
      <main className="flex flex-col w-full min-h-screen max-w-7xl ">
        <div className="flex flex-col items-center gap-6 py-24 pb-16 px-8 sm:py-28 sm:pb-16 sm:px-12 md:py-32 md:pb-16 md:px-15">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">NBA Fantasy Simulator</h1>
          <div className="flex flex-col items-center gap-2 text-center">
            <h3 className="text-lg font-semibold">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce consequat rutrum consectetur.
            </h3>
            <p className="text-md">
              Phasellus justo nisl, fringilla et nisi quis, posuere sagittis justo. Quisque sed risus ut dui feugiat tempus eu quis ipsum. Phasellus vestibulum erat leo, sed venenatis dui volutpat sed.
            </p>
          </div>
        </div>
        <PlayersTable />
      </main>
    </div>
  );
}
