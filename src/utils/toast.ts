import Toast from 'react-native-toast-message';

export const showToast = (
  type: 'success' | 'error' | 'info' = 'success',
  title: string,
  message?: string,
  duration: number = 2000
) => {
  Toast.show({
    type,
    position: 'top',
    text1: title,
    text2: message,
    duration,
    visibilityTime: duration,
  });
};

export const showSuccessToast = (title: string, message?: string) => {
  showToast('success', title, message, 2000);
};

export const showErrorToast = (title: string, message?: string) => {
  showToast('error', title, message, 3000);
};

export const showInfoToast = (title: string, message?: string) => {
  showToast('info', title, message, 2000);
};
