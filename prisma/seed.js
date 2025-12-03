/* eslint-disable @typescript-eslint/no-require-imports */
// prisma/seed.js
// Supabase / Postgres にシードデータを投入するスクリプト

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ============================================
// 既存データ: デモユーザー
// ============================================
const DEMO_USER = {
  id: "demo-user",
  email: "demo@example.com",
  passwordHash: "$2b$10$yR9FptqIldmcxd9YVvN6e.j4nHb3hlxEZ5i8oqLcLh3yM.EuX1X1.",
  name: "Demo User",
};

// ============================================
// 既存データ: Credo アイテム
// ============================================
const CREDO_ITEMS = [
  {
    id: "credo-1",
    order: 1,
    category: "情報の受け取り方",
    title: "頭で覚えず、必ず見える化する",
    description:
      "指示・予定は不変の紙やメモに1行情報で書き出し、口頭指示は自分の言葉でメモする。",
  },
  {
    id: "credo-2",
    order: 2,
    category: "思考・整理のしかた",
    title: "まず全部出し、ピラミッド型で整理する",
    description:
      "予定のタスク・感情を強ぜて書き出し、学校/生活/趣味などに分けてMECEを意識して整理する。",
  },
  {
    id: "credo-3",
    order: 3,
    category: "タスク管理・行動のしかた",
    title: "今日やる3つと、〜15分タスクで進める",
    description:
      "シングルタスクで小さな成功を積み、終わったらチェック。終わらなければ細かく分解して翌日に回す。",
  },
  {
    id: "credo-4",
    order: 4,
    category: "身体の感情・疲労の扱い方",
    title: "状態を記録し、呼吸と瞑想で整える",
    description:
      "睡眠/体調/感情を記録し、思考が詰まったら4-4-6呼吸と短い瞑想でリセットする。",
  },
  {
    id: "credo-5",
    order: 5,
    category: "ジムでの運動",
    title: "前日に時間とメニュー3つを決めて臨む、とやる",
    description:
      "行く時間とウォーターマシン・ストレッチを決め、当日は迷わず実行。行けない日はストレッチや散歩で代替。",
  },
  {
    id: "credo-6",
    order: 6,
    category: "食事（味と体の燃料）",
    title: "プロテイン・魚の頻度を意識してとる",
    description:
      "完璧を追わず、取れた要素に注目して自己調整する。朝やおやつ後にプロテイン、魚と野菜を生活に組み込む。",
  },
  {
    id: "credo-7",
    order: 7,
    category: "部屋の生活環境の整理",
    title: "最初の朝・最後の週1の30分リセットで整える",
    description:
      "短いリセットをルーティン化し、週1回は徹底分解。不用品は処分と紙の仕分けもこの時間に完了。",
  },
  {
    id: "credo-8",
    order: 8,
    category: "日々の改善・学習の継続",
    title: "毎日「小さな改善と不足」を1つ拾う",
    description:
      "読書や実務体験などから1つ学びをメモし、呼吸/運動/食事/整理など続いた習慣にチェックを入れる。",
  },
  {
    id: "credo-9",
    order: 9,
    category: "自己容認・自己肯定の考え方",
    title: "できなかった日も「今日のデータ」として受け取る",
    description:
      "過去ではなく今日の事実で調整し、終れるサイズの成功を習慣化。できたら必ず記録して自信に変える。",
  },
  {
    id: "credo-10",
    order: 10,
    category: "対人・コミュニケーション・人生の姿勢",
    title: "事実と感情を分け、目的と言葉選びを大事にする",
    description:
      "「事実→自分の感情」してほしいこと、で考え、相手立場を意識してからメッセージを送る。",
  },
  {
    id: "credo-11",
    order: 11,
    category: "1日の終わらせ方（ナイトルール）",
    title: "今日の不足・学び・改善を書いて「ここで終わり」と決める",
    description:
      "完了タスクと学びや1つ記録し、4-4-6呼吸と短い瞑想で区切る。続いた習慣にチェックを入れる。",
  },
];

// ============================================
// 新規データ: アバターテンプレート
// ============================================
const AVATAR_TEMPLATES = [
  {
    id: "avatar_student_1",
    name: "生徒A",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_1.glb",
    thumbnailUrl: "/images/avatars/avatar_student_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#4F46E5",
    isPremium: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "avatar_student_2",
    name: "生徒B",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_2.glb",
    thumbnailUrl: "/images/avatars/avatar_student_2.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#10B981",
    isPremium: false,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "avatar_student_3",
    name: "生徒C",
    category: "human",
    modelUrl: "/models/avatars/avatar_student_3.glb",
    thumbnailUrl: "/images/avatars/avatar_student_3.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#F59E0B",
    isPremium: false,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "avatar_teacher_1",
    name: "先生",
    category: "human",
    modelUrl: "/models/avatars/avatar_teacher_1.glb",
    thumbnailUrl: "/images/avatars/avatar_teacher_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#EF4444",
    isPremium: false,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "avatar_cat",
    name: "ねこ",
    category: "animal",
    modelUrl: "/models/avatars/avatar_cat.glb",
    thumbnailUrl: "/images/avatars/avatar_cat.png",
    customizable: { color: true, accessories: false },
    defaultColor: "#8B5CF6",
    isPremium: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "avatar_dog",
    name: "いぬ",
    category: "animal",
    modelUrl: "/models/avatars/avatar_dog.glb",
    thumbnailUrl: "/images/avatars/avatar_dog.png",
    customizable: { color: true, accessories: false },
    defaultColor: "#EC4899",
    isPremium: false,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "avatar_robot_1",
    name: "ロボット",
    category: "robot",
    modelUrl: "/models/avatars/avatar_robot_1.glb",
    thumbnailUrl: "/images/avatars/avatar_robot_1.png",
    customizable: { color: true, accessories: true },
    defaultColor: "#6366F1",
    isPremium: false,
    isActive: true,
    sortOrder: 7,
  },
];

// ============================================
// 新規データ: テスト用ルーム
// ============================================
const TEST_ROOMS = [
  {
    id: "test-classroom-1",
    name: "テスト教室",
    description: "開発テスト用の教室です。自由に入退室できます。",
    type: "CLASSROOM",
    maxParticipants: 20,
    isPublic: true,
    password: null,
    environmentId: "default_classroom",
    spawnPosition: { x: 0, y: 0, z: 5 },
    allowVideo: true,
    allowAudio: true,
    allowScreenShare: true,
    allowChat: true,
    status: "WAITING",
  },
  {
    id: "test-study-group-1",
    name: "テスト自習室",
    description: "自由に使える自習スペースです。静かに勉強しましょう。",
    type: "STUDY_GROUP",
    maxParticipants: 10,
    isPublic: true,
    password: null,
    environmentId: "default_classroom",
    spawnPosition: { x: 0, y: 0, z: 5 },
    allowVideo: true,
    allowAudio: true,
    allowScreenShare: true,
    allowChat: true,
    status: "WAITING",
  },
];

// ============================================
// シード関数: ユーザー
// ============================================
async function seedUsers() {
  await prisma.user.upsert({
    where: { id: DEMO_USER.id },
    update: {
      email: DEMO_USER.email,
      passwordHash: DEMO_USER.passwordHash,
      name: DEMO_USER.name,
    },
    create: DEMO_USER,
  });
  console.log("✅ Demo user seeded");
}

// ============================================
// シード関数: Credo アイテム
// ============================================
async function seedCredoItems() {
  for (const item of CREDO_ITEMS) {
    await prisma.credoItem.upsert({
      where: { id: item.id },
      update: {
        order: item.order,
        category: item.category,
        title: item.title,
        description: item.description,
      },
      create: item,
    });
  }
  console.log("✅ Credo items seeded (11 items)");
}

// ============================================
// シード関数: アバターテンプレート
// ============================================
async function seedAvatarTemplates() {
  for (const avatar of AVATAR_TEMPLATES) {
    await prisma.avatarTemplate.upsert({
      where: { id: avatar.id },
      update: {
        name: avatar.name,
        category: avatar.category,
        modelUrl: avatar.modelUrl,
        thumbnailUrl: avatar.thumbnailUrl,
        customizable: avatar.customizable,
        defaultColor: avatar.defaultColor,
        isPremium: avatar.isPremium,
        isActive: avatar.isActive,
        sortOrder: avatar.sortOrder,
      },
      create: avatar,
    });
  }
  console.log("✅ Avatar templates seeded (7 items)");
}

// ============================================
// シード関数: テスト用ルーム
// ============================================
async function seedTestRooms() {
  for (const room of TEST_ROOMS) {
    // ルームを作成または更新
    const createdRoom = await prisma.virtualRoom.upsert({
      where: { id: room.id },
      update: {
        name: room.name,
        description: room.description,
        type: room.type,
        maxParticipants: room.maxParticipants,
        isPublic: room.isPublic,
        password: room.password,
        environmentId: room.environmentId,
        spawnPosition: room.spawnPosition,
        allowVideo: room.allowVideo,
        allowAudio: room.allowAudio,
        allowScreenShare: room.allowScreenShare,
        allowChat: room.allowChat,
        status: room.status,
      },
      create: {
        id: room.id,
        name: room.name,
        description: room.description,
        type: room.type,
        maxParticipants: room.maxParticipants,
        isPublic: room.isPublic,
        password: room.password,
        environmentId: room.environmentId,
        spawnPosition: room.spawnPosition,
        allowVideo: room.allowVideo,
        allowAudio: room.allowAudio,
        allowScreenShare: room.allowScreenShare,
        allowChat: room.allowChat,
        status: room.status,
        hostId: DEMO_USER.id, // デモユーザーをホストに設定
      },
    });

    // ホストを参加者として追加（存在しなければ）
    const participantId = `${room.id}-host`;
    await prisma.roomParticipant.upsert({
      where: { id: participantId },
      update: {
        role: "HOST",
        avatarId: "avatar_teacher_1",
        avatarColor: "#EF4444",
        displayName: DEMO_USER.name,
      },
      create: {
        id: participantId,
        roomId: createdRoom.id,
        userId: DEMO_USER.id,
        role: "HOST",
        avatarId: "avatar_teacher_1",
        avatarColor: "#EF4444",
        displayName: DEMO_USER.name,
        positionX: 0,
        positionY: 0,
        positionZ: 0,
        rotationY: 0,
        currentAction: "idle",
        isVideoOn: false,
        isAudioOn: false,
        isSharingScreen: false,
        isHandRaised: false,
        isConnected: false,
      },
    });

    // メインホワイトボードを作成（存在しなければ）
    const whiteboardId = `${room.id}-main-whiteboard`;
    await prisma.whiteboard.upsert({
      where: { id: whiteboardId },
      update: {
        name: "メインボード",
      },
      create: {
        id: whiteboardId,
        name: "メインボード",
        roomId: createdRoom.id,
        elements: [],
        appState: {},
        isLocked: false,
        allowedEditors: [],
      },
    });
  }
  console.log("✅ Test rooms seeded (2 rooms with participants & whiteboards)");
}

// ============================================
// メイン関数
// ============================================
async function main() {
  console.log("🌱 Starting seed...\n");

  // 既存シード
  await seedUsers();
  await seedCredoItems();

  // バーチャル教室用シード
  await seedAvatarTemplates();
  await seedTestRooms();

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });