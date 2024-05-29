import { Timestamp } from "firebase/firestore";

export default function useHandleFormControls(state: any, setState: any) {
    const handleDropDown = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [e.target.name]: e.target.checked });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    const handleDate = (date: Date, field: string) => {
        setState({ ...state, [`${field}`]: Timestamp.fromDate(date) });
    };

    const handleTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>, field: string) => {
        setState({ ...state, [`${field}`]: e.target.value });
      };
    

    return {
        handleDropDown,
        handleCheckbox,
        handleInput,
        handleDate,
        handleTextArea
    }
}