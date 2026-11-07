import http from '@/api/http.js'

// Получение всех чатов пользователя
export async function getChats(userId) {
    const response = await http.get(`/chats`, {
        params: {
            userId: userId,
            _expand: 'listing',
        }
    })
    return response.data
}

// Обновление существующего чата
export async function updateChat(id, chatData) {
    const response = await http.patch(`/chats/${id}`, chatData)
    return response.data
}

// Получение сообщений чата
export async function getMessages(chatId) {
    const response = await http.get(`/messages`, {
        params: {
            chatId: chatId,
            _sort: 'createdAt',
            _order: 'asc',
        }
    })
    return response.data
}

// Создание нового сообщения
export async function createMessage(messageData) {
    const response = await http.post('/messages', messageData)
    return response.data
}