import type { GroupId } from '../../../domain/types';

export const learning = {
  subject: '— кто: I, you, he, she, we, they',
  formulas:
    'Читай слева направо, затем добавь остальные слова. В Present Simple с he / she / it используй V-s (окончание -s / -es) или does; с остальными — V1 или do. В Present Perfect: he / she / it — has; остальные — have. Для Continuous: I — am; he / she / it — is; you / we / they — are. В прошлом: I / he / she / it — was; you / we / they — were.',
  simpleRules:
    'После do / does / did глагол всегда в начальной форме V1. Формулы Simple здесь — для обычных глаголов; to be и модальные глаголы работают по отдельным правилам.',
  mapCaption:
    'В основе примеров — work. Некоторые формы, особенно Future Perfect Continuous, встречаются редко: выбор определяется контекстом.',
  simpleNote:
    'Дрилл-таблица охватывает три времени Simple. Глагол to be и модальные глаголы работают по отдельным правилам.',
  perfectNote:
    'Present Perfect: have/has + V3. Маркеры already / yet — подсказки, а не обязательные признаки.',
  otherNote:
    'Это расширение матрицы на другие аспекты. При выборе формы ориентируйся на смысл и контекст.',
};
export const groupDescriptions: Record<GroupId, string> = {
  all: 'Общая карта всех времён — сначала структура, затем отработка.',
  simple:
    'Три времени Simple × три типа предложения: утверждение, отрицание и вопрос.',
  continuous: 'То же упражнение на действия в процессе.',
  perfect: 'Результат к определённому моменту.',
  perfectContinuous: 'Продолжительность действия до определённого момента.',
  presentPerfect: 'Три формы Present Perfect для всех лиц.',
};
