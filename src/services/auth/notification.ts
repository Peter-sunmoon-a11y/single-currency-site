import authAxiosInstance from "@/lib/authAxios";

export async function getNotificationMessage(data: any): Promise<any> {
    const response = await authAxiosInstance.post("/NotificationMessage/getMessageV1", data);
    return response.data;
}

export async function setNotificationMessageRead(data: any): Promise<any> {
    const response = await authAxiosInstance.post(`/NotificationMessage/readV1?ids=${data?.ids}`);
    return response.data;
}
