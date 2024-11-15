'use client';

import Image from 'next/image';

import { useEffect } from 'react';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './code-popup.css';

export default function CodePopUp({
    code,
    setCode,
}: {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string | undefined>>;
}) {
    useEffect(() => {
        setTimeout(() => {
            const form = document.querySelector('div.code-popup') as HTMLElement;
            form.style.animation = 'none';
        }, 800);
    }, []);

    return (
        <div className='code-popup'>
            <div>
                <Image
                    src={'/images/svg/cross.svg'}
                    alt='cross'
                    width={18}
                    height={18}
                    onClick={() => {
                        const popup = document.querySelector('div.code-popup') as HTMLElement;
                        popup.style.animation = 'form-appear 750ms ease-out reverse forwards';
                        setTimeout(() => {
                            setCode(undefined);
                        }, 800);
                    }}
                />
                <SyntaxHighlighter language='json' style={github} wrapLines wrapLongLines>
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
