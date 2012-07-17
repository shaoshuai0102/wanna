# Post Specification

A post consists of two parts:

1.  Meta info.
2.  Content.

## Meta Info

Example:

    <!--
    {
        "layout": "post",
        "title": "A flexible event model in JavaScript-《Ajax In Action》",
        "date": "2009-11-03 15:41",
        "comments": true,
        "categories": ["技术相关", "tech"]
    }
    -->


Meta infomations must be surrounded by `<!-- -->`, which is default syntax of html comments.

Available attributes:

*   title - The title of the current post.
*   date - The created date the current post.
*   comments - If comments is allowed or not.
*   categories - The categories of current post. It can be a string or an array of string.
*   layout - Optional. The layout of current post. It defaults to post if not specified.

## Content

The content of current page. Wanna regards it as a markdown file.
