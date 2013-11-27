/**
 * 
 */
package com.lg.app.support.log;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Gao xingang
 * @since 2013-3-11
 * @description
 * @TODO
 */
@Target(value = ElementType.METHOD)
@Retention(value = RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    String action() default "";

    String description() default "";
}
