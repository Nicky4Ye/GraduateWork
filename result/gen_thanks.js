const fs = require("fs");
const { Packer } = require("docx");
const {
  Document,
  PAGE_PROPERTIES,
  STYLES,
  createSpecialHeading,
  createBodyParagraph,
} = require("./docx_utils");

const paragraphs = [
  "首先，我要衷心感谢我的指导老师。在毕业设计的整个过程中，老师在选题方向、研究思路、算法设计和论文撰写等方面给予了悉心的指导和耐心的帮助。每当我在算法实现中遇到困难或对实验结果产生困惑时，老师总能以敏锐的学术洞察力为我指明方向，帮助我理清思路、突破瓶颈。老师严谨求实的治学态度和精益求精的工作作风，不仅使本论文得以顺利完成，更让我受益终身。",
  "感谢大学四年来所有教导过我的老师们。是你们在课堂上传授的专业知识，为我打下了坚实的理论基础，使我具备了开展本课题研究的能力。特别感谢在数据结构、算法设计与分析等课程中给予我启发的老师们，这些知识构成了本论文研究工作的重要基石。",
  "感谢与我朝夕相处的同学和室友们。在四年的学习生活中，我们一起讨论问题、分享心得、互相鼓励。在毕业设计期间，同学们在代码调试、实验方案讨论和文献检索等方面给予了我诸多帮助，许多富有建设性的建议使我的研究思路更加清晰、方案更加完善。这份珍贵的同窗情谊，将是我大学生活中最美好的记忆。",
  "感谢我的家人对我始终如一的支持与关爱。是你们在背后的默默付出和无条件的信任，给了我追求学业、克服困难的勇气和动力。你们的理解与包容，是我最坚实的后盾。",
  "最后，感谢在论文评阅和答辩过程中提出宝贵意见的各位专家和老师。你们的建议将帮助我进一步完善研究成果，也为我今后的学习和工作指明了方向。",
  "学海无涯，本论文虽已完成，但我深知自己在专业知识和研究能力方面仍有诸多不足。未来的道路上，我将继续秉持求真务实的精神，不断学习、不断进步，以不辜负所有关心和帮助过我的人。",
];

const doc = new Document({
  ...PAGE_PROPERTIES,
  styles: STYLES,
  sections: [
    {
      ...PAGE_PROPERTIES,
      children: [
        createSpecialHeading("致谢"),
        ...paragraphs.map((p) => createBodyParagraph(p)),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("致谢.docx", buf);
  console.log("Generated 致谢.docx");
});
