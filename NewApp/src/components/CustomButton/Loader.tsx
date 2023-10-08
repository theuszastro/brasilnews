import React from 'react';

import { Svg, Circle } from 'react-native-svg';
import { wp } from '../../utils/responsive';

const Loader: React.FC<{
    size?: number;
    color?: string;
    strokeWidth?: number;
    circleSize?: number;
    radius?: number;
}> = ({
    size = wp('7%'),
    color = 'white',
    strokeWidth = wp('.7%'),
    radius = (size - strokeWidth) / 2,
    circleSize = wp('7%'),
}) => {
    const circumference = radius * Math.PI * 2;

    return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <Circle
                fill="none"
                stroke={color}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="round"
                strokeDasharray={[circleSize, circumference]}
            />
        </Svg>
    );
};

export default Loader;
