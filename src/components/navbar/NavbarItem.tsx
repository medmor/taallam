import Link from "next/link";


interface NavbarItemProps {
    href: string;
    label: string;
    active: boolean
}
export default function NavbarItem({ href, label, active }: NavbarItemProps) {
    console.log(active)
    return (
        <li className={`hover:text-neutral-800 hover:text-lg ${active ? "text-orange-600" : ""}`}>
            <Link href={href} >{label}</Link>
        </li>
    )
}