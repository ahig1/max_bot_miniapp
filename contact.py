import os

# Настройки
TARGET_DIR = r'C:\Users\User_PC\Desktop\bot\bot-forms'
OUTPUT_FILE = 'frontend_code.txt'
ALLOWED_EXTENSIONS = {'.json', '.ts', '.tsx', '.html', '.js', '.jsx', '.css'}
IGNORE_DIRS = {'node_modules', '.git', 'build', 'dist', '.next', 'out'}

def gather_code():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(TARGET_DIR):
            # Исключаем тяжелые и ненужные папки "на лету"
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ALLOWED_EXTENSIONS:
                    filepath = os.path.join(root, file)
                    
                    # Пропускаем package-lock.json, он огромный и нам не нужен
                    if file == 'package-lock.json' or file == 'yarn.lock':
                        continue

                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        # Красиво отделяем файлы друг от друга
                        outfile.write(f"\n\n{'='*60}\n")
                        outfile.write(f"FILE: {filepath}\n")
                        outfile.write(f"{'='*60}\n\n")
                        outfile.write(content)
                    except Exception as e:
                        print(f"Не смог прочитать {filepath}: {e}")

    print(f"✅ Готово! Весь код собран в файл: {OUTPUT_FILE}")

if __name__ == "__main__":
    gather_code()