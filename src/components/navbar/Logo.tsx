
import Image from "next/image";

const Logo = () => {

    return (
        <Image
            className="cursor-pointer border rounded-2xl mx-4"
            src="/images/logo.png"
            height="100"
            width="80"
            alt="80"
        />
    );
}

export default Logo;
