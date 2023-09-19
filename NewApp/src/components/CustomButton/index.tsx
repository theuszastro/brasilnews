import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import { ViewStyle } from 'react-native';
import Reanimated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Loader from './Loader';

export type ButtonRef = {
    startAnimation: Function;
    stopAnimation: Function;
};

type Props = {
    children: React.ReactNode;

    component: React.FunctionComponent<any>;
    onPress: Function;

    loaderStyle?: ViewStyle;
    buttonStyle?: ViewStyle;

    loaderProps?: {
        size?: number;
        color?: string;
        strokeWidth?: number;
        circleSize?: number;
    };
};

const CustomButton = forwardRef<ButtonRef, Props>(
    ({ component: Component, onPress, children, loaderStyle: data = {}, buttonStyle = {}, loaderProps = {} }, ref) => {
        const alreadyPressed = useRef(false);

        const opacityChildren = useSharedValue(1);
        const opacityLoader = useSharedValue(0);
        const rotate = useSharedValue(0);

        const childrenStyle = useAnimatedStyle(() => {
            return { opacity: opacityChildren.value };
        });

        const loaderStyle = useAnimatedStyle(() => {
            return {
                opacity: opacityLoader.value,
                transform: [{ rotate: `${rotate.value}deg` }],
            };
        });

        function handlePress() {
            if (alreadyPressed.current) return;

            onPress();
        }

        useImperativeHandle(ref, () => {
            return {
                startAnimation: () => {
                    if (alreadyPressed.current) return;

                    alreadyPressed.current = true;

                    opacityChildren.value = 0;
                    opacityLoader.value = 1;

                    rotate.value = withRepeat(
                        withTiming(360, {
                            duration: 1500,
                            easing: Easing.linear,
                        }),
                        Infinity
                    );
                },
                stopAnimation: () => {
                    if (!alreadyPressed.current) return;

                    alreadyPressed.current = false;

                    cancelAnimation(rotate);

                    opacityChildren.value = 1;
                    opacityLoader.value = 0;
                    rotate.value = 0;
                },
            };
        });

        return (
            <Component onPress={handlePress}>
                <Reanimated.View style={[{ position: 'absolute', ...buttonStyle }, childrenStyle]}>
                    {children}
                </Reanimated.View>

                <Reanimated.View
                    style={[
                        {
                            position: 'absolute',

                            ...data,
                        },
                        loaderStyle,
                    ]}
                >
                    <Loader {...loaderProps} />
                </Reanimated.View>
            </Component>
        );
    }
);

export default CustomButton;
