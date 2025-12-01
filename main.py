def simple_console_bot():
    print("Здравствуйте! Введите ваше имя...")

    while True:
        user_input = input("Вы: ")
        user_input_lower = user_input.lower()
        if user_input == "Саня":
            print("Приятно познакомиться! Как твои дела?")


        if user_input_lower == 'пока':
            print("До свидания! Спишемся позже :D")
            break
        elif 'привет' in user_input_lower or 'здравствуй' in user_input_lower:
            print("Привет! Как дела?")
        elif 'как дела' in user_input_lower:
            print("У меня всё отлично, а у вас как?")
        elif 'что делаешь' in user_input_lower:
            print("Общаюсь с вами :З")

if __name__ == "__main__":
    simple_console_bot()