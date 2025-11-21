// 题目数据存储
let allQuestions = {
    judge: [],
    single: [],
    multiple: [],
    fill: []
};

let currentFilter = 'all';
let trainingQuestions = [];

// 页面加载时初始化
window.onload = function() {
    loadAllQuestions();
};

// 加载所有题目数据
async function loadAllQuestions() {
    try {
        // 显示加载状态
        document.getElementById('questions-container').innerHTML = 
            '<p style="text-align: center; color: #666;">正在加载题目数据...</p>';
        
        // 加载判断题
        const judgeResponse = await fetch('判断题.json');
        const judgeData = await judgeResponse.json();
        allQuestions.judge = judgeData.map(q => ({
            ...q,
            type: 'judge',
            typeName: '判断题'
        }));
        
        // 加载单选题
        const singleResponse = await fetch('单选题.json');
        const singleData = await singleResponse.json();
        allQuestions.single = singleData.map(q => ({
            ...q,
            type: 'single',
            typeName: '单选题'
        }));
        
        // 加载多选题
        const multipleResponse = await fetch('多选题.json');
        const multipleData = await multipleResponse.json();
        allQuestions.multiple = multipleData.map(q => ({
            ...q,
            type: 'multiple',
            typeName: '多选题'
        }));
        
        // 加载填空题
        const fillResponse = await fetch('填空题.json');
        const fillData = await fillResponse.json();
        allQuestions.fill = fillData.map(q => ({
            ...q,
            type: 'fill',
            typeName: '填空题'
        }));
        
        // 显示题目
        displayQuestions();
        
    } catch (error) {
        console.error('加载题目失败:', error);
        document.getElementById('questions-container').innerHTML = 
            '<p style="text-align: center; color: red;">加载题目失败，请检查JSON文件是否正确上传</p>';
    }
}

// 显示题目
function displayQuestions() {
    const container = document.getElementById('questions-container');
    let questions = [];
    
    // 根据筛选条件选择题目
    if (currentFilter === 'all') {
        questions = [...allQuestions.judge, ...allQuestions.single, ...allQuestions.multiple, ...allQuestions.fill];
    } else {
        questions = allQuestions[currentFilter];
    }
    
    // 按题号排序
    questions.sort((a, b) => {
        const numA = parseInt(a.题号) || 0;
        const numB = parseInt(b.题号) || 0;
        return numA - numB;
    });
    
    // 显示统计信息
    const statsHtml = `
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${allQuestions.judge.length}</div>
                <div class="stat-label">判断题</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${allQuestions.single.length}</div>
                <div class="stat-label">单选题</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${allQuestions.multiple.length}</div>
                <div class="stat-label">多选题</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${allQuestions.fill.length}</div>
                <div class="stat-label">填空题</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${allQuestions.judge.length + allQuestions.single.length + allQuestions.multiple.length + allQuestions.fill.length}</div>
                <div class="stat-label">总计</div>
            </div>
        </div>
    `;
    
    // 生成题目HTML
    const questionsHtml = questions.map(question => createQuestionCard(question, false)).join('');
    
    container.innerHTML = statsHtml + questionsHtml;
}

// 创建题目卡片
function createQuestionCard(question, hideAnswer = false) {
    const typeClass = `type-${question.type}`;
    
    let optionsHtml = '';
    if (question.type === 'single' || question.type === 'multiple') {
        const options = Object.entries(question.选项 || {}).map(([key, value]) => `
            <div class="option">${key}. ${value}</div>
        `).join('');
        optionsHtml = `<div class="options">${options}</div>`;
    }
    
    // 判断题特殊处理
    let answerContent = question.正确答案;
    if (question.type === 'judge') {
        answerContent = question.正确答案 === '对' ? '正确' : '错误';
    }
    
    // 多选题答案格式化
    if (question.type === 'multiple' && typeof answerContent === 'string') {
        answerContent = answerContent.split('').join(', ');
    }
    
    // 填空题答案
    let fillAnswerHtml = '';
    if (question.type === 'fill') {
        const answerText = question.正确答案 || '';
        // 处理多个可能的答案
        const answers = answerText.split('或').map(ans => ans.trim());
        answerContent = answers.length > 1 ? answers.join(' 或 ') : answers[0];
    }
    
    return `
        <div class="question-card ${question.type} ${hideAnswer ? 'answer-hidden' : ''}">
            <div class="question-header">
                <span class="question-type ${typeClass}">${question.typeName}</span>
                <span style="color: #666; font-weight: 600;">题号：${question.题号}</span>
            </div>
            <div class="question-title">${question.题目}</div>
            ${optionsHtml}
            ${question.type === 'fill' ? '<div style="height: 30px; border-bottom: 1px dashed #999; margin: 10px 0;"></div>' : ''}
            <div class="answer-section">
                <div class="answer-label">答案：</div>
                <div class="answer-content">${answerContent}</div>
                ${hideAnswer ? '<button class="show-answer-btn" onclick="toggleSingleAnswer(this)">显示答案</button>' : ''}
            </div>
        </div>
    `;
}

// 筛选题目
function filterQuestions(type) {
    currentFilter = type;
    
    // 更新按钮状态
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新显示题目
    displayQuestions();
}

// 切换显示区域
function showSection(section) {
    // 更新标签状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 显示对应区域
    document.getElementById('display-section').style.display = section === 'display' ? 'block' : 'none';
    document.getElementById('training-section').style.display = section === 'training' ? 'block' : 'none';
}

// 开始专项训练
function startTraining() {
    const container = document.getElementById('training-container');
    container.innerHTML = '<p style="text-align: center; color: #666;">正在生成训练题...</p>';
    
    // 每个类型随机抽取40题（如果不足40题则全部抽取）
    trainingQuestions = [];
    
    // 判断题
    const judgeSample = shuffleArray([...allQuestions.judge]).slice(0, 40);
    trainingQuestions.push(...judgeSample);
    
    // 单选题
    const singleSample = shuffleArray([...allQuestions.single]).slice(0, 40);
    trainingQuestions.push(...singleSample);
    
    // 多选题
    const multipleSample = shuffleArray([...allQuestions.multiple]).slice(0, 40);
    trainingQuestions.push(...multipleSample);
    
    // 填空题
    const fillSample = shuffleArray([...allQuestions.fill]).slice(0, 40);
    trainingQuestions.push(...fillSample);
    
    // 打乱顺序
    trainingQuestions = shuffleArray(trainingQuestions);
    
    // 默认隐藏答案
    document.getElementById('show-answers').checked = false;
    
    // 显示题目
    const questionsHtml = trainingQuestions.map(question => createQuestionCard(question, true)).join('');
    container.innerHTML = questionsHtml;
    
    // 滚动到顶部
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 数组打乱算法
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 切换所有答案显示/隐藏
function toggleAnswers() {
    const showAnswers = document.getElementById('show-answers').checked;
    const cards = document.querySelectorAll('#training-container .question-card');
    
    cards.forEach(card => {
        if (showAnswers) {
            card.classList.remove('answer-hidden');
        } else {
            card.classList.add('answer-hidden');
        }
    });
}

// 切换单个答案显示
function toggleSingleAnswer(button) {
    const card = button.closest('.question-card');
    card.classList.remove('answer-hidden');
    button.style.display = 'none';
}
