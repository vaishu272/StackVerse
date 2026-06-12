import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { BlogPost } from "@/features/blog/types/blog";

const styles = StyleSheet.create({
  page: {
    paddingTop: 60,
    paddingBottom: 65,
    paddingHorizontal: 50,
    fontSize: 11,
    color: "#1e293b",
    fontFamily: "Helvetica",
  },
  header: {
    position: "absolute",
    top: 30,
    left: 50,
    right: 50,
    fontSize: 9,
    color: "#64748b",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
    marginTop: 20,
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    color: "#64748b",
    marginBottom: 20,
  },
  category: {
    fontSize: 9,
    color: "#4f46e5",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  excerptBox: {
    fontSize: 11,
    color: "#475569",
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#4f46e5",
    padding: 10,
    marginBottom: 25,
    lineHeight: 1.5,
  },
  content: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: "#334155",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 8,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface BlogPDFDocumentProps {
  post: BlogPost;
}

export default function BlogPDFDocument({ post }: BlogPDFDocumentProps) {
  // Simple HTML parser to strip tags but keep paragraphs, headings, list bullets
  const formatHTMLToText = (html: string) => {
    if (!html) return "";
    return html
      .replace(/<\/p>/g, "\n\n")
      .replace(/<\/h[1-6]>/g, "\n\n")
      .replace(/<li>/g, "  • ")
      .replace(/<\/li>/g, "\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<[^>]*>/g, "") // remove other HTML tags
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  };

  const plainTextContent = formatHTMLToText(post.htmlContent);
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Recurring Header */}
        <View style={styles.header} fixed>
          <Text>StackVerse Engineering Hub</Text>
          <Text>{post.category}</Text>
        </View>

        {/* Category Header */}
        <Text style={styles.category}>{post.category}</Text>

        {/* Title */}
        <Text style={styles.title}>{post.title}</Text>

        {/* Metadata */}
        <Text style={styles.meta}>
          Published by {post.author?.name || "Elena Rostova"} on {formattedDate}
        </Text>

        {/* Excerpt Summary */}
        {post.excerpt && (
          <View style={styles.excerptBox}>
            <Text style={{ fontStyle: "italic" }}>{post.excerpt}</Text>
          </View>
        )}

        {/* Body Content */}
        <Text style={styles.content}>{plainTextContent}</Text>

        {/* Recurring Footer */}
        <View style={styles.footer} fixed>
          <Text>© {new Date().getFullYear()} StackVerse. All rights reserved.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
