// packages
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const wp = (percent: string | number) => {
    const w = typeof percent === 'number' ? percent : parseFloat(percent);

    return PixelRatio.roundToNearestPixel((width * w) / 100);
};

export const hp = (percent: string | number) => {
    const h = typeof percent === 'number' ? percent : parseFloat(percent);

    return PixelRatio.roundToNearestPixel((height * h) / 100);
};
