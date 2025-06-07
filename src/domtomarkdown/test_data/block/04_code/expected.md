## Простая программа со сборкой через CMake

* Создайте в каталоге `sfml.1` файл с именем `CMakeLists.txt`
* Скопируйте следующий текст в файл и сохраните в этом файле:

```cmake
# Минимальная версия CMake: 3.8
cmake_minimum_required(VERSION 3.8 FATAL_ERROR)

# Имя проекта: sfml-lab-1
project(sfml-lab-1)

# Подкаталог 00 содержит ещё один CMakeLists.txt
add_subdirectory(00)
```

```html
<blockquote>
	<p><strong>Виктор</strong>: Да. Виноват. Понимаешь, он мне что-то нравится.</p>
	<p><strong>Диана</strong>: А мне — нет</p>
</blockquote>
```