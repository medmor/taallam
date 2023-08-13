export const rndItem = (arr: any[]) => arr[rnd(0, arr.length)];
export const rnd = (min: number, max: number) => min + Math.floor(Math.random() * max);

export const rndExclude = (min:number, max:number, excludes:number[])=>{
    if(excludes.length == 2 && excludes.includes(min) && excludes.includes(max)){
        throw new Error("No possible numbers to generate")
    }
    const numb = rnd(min, max);
    if (excludes.includes(numb)) {
        rndExclude(min, max, excludes)
    } 
    return numb
}