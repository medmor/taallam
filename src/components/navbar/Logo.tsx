
import Image from "next/image";

interface LogoProps {
    src: string
}

const Logo = ({ src }: LogoProps) => {

    return (
        <Image
            className="cursor-pointer border rounded-2xl mx-4"
            src={src}
            height="60"
            width="60"
            alt="logo"
        />
    );
}

export default Logo;
