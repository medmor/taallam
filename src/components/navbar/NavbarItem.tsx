import Link from "next/link";


interface NavbarItemProps {
    href: string;
    label: string;
    active: boolean
}
export default function NavbarItem({ href, label, active }: NavbarItemProps) {
    return (<Link href={href}  >
        <li className={`hover:opacity-90 bg-center bg-cover w-[100px] h-[75px] flex justify-center items-center ${active ? "text-orange-700 font-bold" : ""}`}
            style={{ backgroundImage: "url('/images/home/cloudNav.png')" }}
        >
            {label}
        </li>
    </Link>
    )
}