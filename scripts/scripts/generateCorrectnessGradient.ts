import { generateGradient } from  "typescript-color-gradient";


const generateCorrectnessGradient = () => {
    const gradientArray = generateGradient(["#d6dbd7", "#22c951"], 21);

    console.log(gradientArray);
}

generateCorrectnessGradient()