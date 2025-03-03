import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, Alert } from 'react-native';
import { CopySession } from '@aw/index';
import DatePicker from 'react-native-date-picker'


// Props pro komponentu SetUpSession
interface SetUpSessionProps {
    SessionId: string;
    Name: string;
    Place: string;
    Time: Date;
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    onSave: () => void;
}

// 🔹 Komponenta pro editaci data
const CustomDateInput = ({ value, onChange }: { value: string; onChange: (date: string) => void }) => {
    const [dateText, setDateText] = useState(value);

    const handleBlur = () => {
        const parsedDate = new Date(dateText);
        if (!isNaN(parsedDate.getTime())) {
            onChange(parsedDate.toISOString().slice(0, 16)); // Formát YYYY-MM-DDTHH:MM
        } else {
            Alert.alert("Neplatné datum", "Zadejte platné datum ve formátu YYYY-MM-DD HH:MM");
            setDateText(value); // Obnoví původní hodnotu při neplatném datu
        }
    };

    return (
        <View>
            <Text style={styles.label}>Select Date:</Text>
            <TextInput
                style={styles.input}
                value={dateText}
                onChangeText={setDateText}
                onBlur={handleBlur}
                placeholder="YYYY-MM-DD HH:MM"
            />
        </View>
    );
};

// 🔹 SetUpSession hlavní komponenta
const SetUpSession: React.FC<SetUpSessionProps> = ({ SessionId, Name, Place, Time, modalVisible, setModalVisible, onSave }) => {
    // Zkontrolujeme, jestli je Time platný Date objekt
    const [newName, setNewName] = useState(Name);
    const [newPlace, setNewPlace] = useState(Place);
    const [newSessionDate, setNewSessionDate] = useState(new Date());
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

    const handleSave = async () => {
        try {
            const parsedDate = new Date(newSessionDate); // Vytvoření nového Date objektu z hodnoty newTime
            if (isNaN(parsedDate.getTime())) {
                throw new Error('Neplatné datum');
            }

            // Volání funkce pro kopírování session s novými hodnotami
            await CopySession(SessionId, newName, newPlace, parsedDate);
            setModalVisible(false);
            onSave();
        } catch (error) {
            console.error('Failed to update session:', error);
            Alert.alert('Chyba', 'Při ukládání došlo k chybě.');
        }
    };

    return (
        <Modal visible={modalVisible} transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Session</Text>

                    <TextInputField label="Name" value={newName} onChangeText={setNewName} />
                    <TextInputField label="Place" value={newPlace} onChangeText={setNewPlace} />
                    <TouchableOpacity
                        onPress={() => setIsDatePickerVisible(true)}
                        className="border border-gray-300 rounded-lg p-3 mb-4 text-lg"
                    >
                        <Text>{newSessionDate.toLocaleString()}</Text>
                    </TouchableOpacity>
        
                    <DatePicker
                        modal
                        open={isDatePickerVisible}
                        date={newSessionDate}
                        onConfirm={(date) => {
                        setIsDatePickerVisible(false)
                        setNewSessionDate(date)
                        }}
                        onCancel={() => {
                        setIsDatePickerVisible(false)
                        }}
                    />
                    <View style={styles.buttonContainer}>
                        <Button text="Cancel" onPress={() => setModalVisible(false)} />
                        <Button text="Save" onPress={handleSave} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// 🔹 Komponenta pro TextInput pole
const TextInputField = ({ label, value, onChangeText }: { label: string; value: string; onChangeText: (text: string) => void }) => (
    <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}:</Text>
        <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType="default"
        />
    </View>
);

// 🔹 Reusable Button komponenta
const Button = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <TouchableOpacity onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
);

// 🔹 Stylování
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 370,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 14,
        color: 'black',
    },
    inputContainer: {
        marginBottom: 10,
    },
    textInput: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
    },
    input: {
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#439ECF',
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default SetUpSession;
