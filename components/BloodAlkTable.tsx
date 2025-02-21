/************************/
/*  Name: Tomáš Skýpala  */
/*  Login: xskypa03     */
/*  Date: 12.15.2024    */
/************************/

import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { View, Dimensions, Text } from 'react-native';

// Interface for the component props
interface BloodAlkTableProps {
    datasets: { data: number[] }[];
    labels: string[];
}

// Component to display blood alcohol level chart
const BloodAlkTable: React.FC<BloodAlkTableProps> = ({ datasets, labels }) => {
    if (!datasets || datasets.length === 0 || !datasets[0].data) {
        return (
            <View className="flex-1 items-center mb-6">
                <Text className="text-white">No data available</Text>
            </View>
        );
    }
    // Format labels to display only hours and minutes when minutes are 0
    const formattedLabels = labels.map(label => {
        const date = new Date(label);
        return date.getMinutes() === 0 ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    });


    return (
        <View className="flex-1 items-center mb-6">
            {/* Display the chart */}
            <LineChart
                data={{
                    labels: formattedLabels,
                    datasets: datasets,
                }}
                width={320}
                height={220}
                yAxisLabel=""
                yAxisSuffix="‰"
                chartConfig={{
                    backgroundColor: 'black',
                    backgroundGradientFrom: 'black',
                    backgroundGradientTo: 'black',
                    decimalPlaces: 2,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { display : 'none' },
                    propsForBackgroundLines: { display: 'none' },
                    propsForHorizontalLabels: {},
                }}
                style={{ marginVertical: 8, borderRadius: 16 }}
            />
        </View>
    );
};

export default BloodAlkTable;