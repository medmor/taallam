import Link from "next/link"



export default function Navbar() {
    return (
        <nav className="p-4 bg-blue-700 flex" >
            <Link href='/' className="font-bold text-xl text-white me-4">Taallam</Link>
            <ul className="text-white flex space-x-4 p-1">
                <li>
                    <Link href='/courses/preschool.2' >Preschool 2</Link>
                </li>
                <li>
                    <Link href='/courses/preschool.3' >Primary 3</Link>
                </li>
                <li>
                    <Link href='/stories' className="text-orange-400 font-semibold" >Stories</Link>
                </li>
            </ul>
        </nav>
    )
}