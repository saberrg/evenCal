import Image from "next/image";
import Calendar from "./components/Calendar";

export default function Home() {
  return (
    <div>
      <Calendar editable={false} />
    </div>
  );
}
