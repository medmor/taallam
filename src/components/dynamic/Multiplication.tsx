export default function Multiplication() {
    const firstNumber = 5;
    const secondNumber = 5;
    const result: number | undefined = undefined;
    return (
        <div className={`p-10 rounded-lg flex flex-col items-center justify-center bg-white`}>
            <div>{firstNumber} x {secondNumber}</div>
            <div>{firstNumber * secondNumber}</div>
        </div>
    )
}